import json
import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend import main


SOURCE = {
    "id": "S1",
    "title": "Quantum correlations",
    "authors": "A. Example",
    "year": "2024",
    "url": "https://arxiv.org/abs/2401.00001",
    "abstract": "A sample abstract for the debate workflow test.",
    "journal_ref": "",
    "source_type": "arXiv abstract",
}


class DebateWorkflowTests(unittest.IsolatedAsyncioTestCase):
    async def run_debate(
        self,
        decisions: list[dict[str, object]],
        *,
        question: str = "L'entanglement permette comunicazioni più veloci della luce?",
        sources: list[dict[str, str]] | None = None,
    ) -> tuple[dict, list[dict], list[dict], list[dict]]:
        responses = []
        for round_number in range(1, len(decisions) + 1):
            if round_number == 1:
                responses.extend(
                    [
                        "Nova: tesi teorica iniziale.",
                        "Atlas: evidenza e risposta alla tesi di Nova.",
                        "Sigma: obiezione concreta alla spiegazione.",
                    ]
                )
            else:
                responses.extend(
                    [
                        f"Nova: replica del round {round_number}.",
                        f"Atlas: valutazione del round {round_number}.",
                    ]
                )
        responses.append("### La risposta\nSintesi finale di Luna, basata sul dibattito.")
        if decisions[-1]["verdict"] != "supported":
            responses.append("Sigma: nota finale sulla cautela emersa.")

        stream_calls: list[dict] = []
        review_calls: list[dict] = []
        streamed_events: list[dict] = []

        async def fake_search_arxiv(question: str) -> list[dict[str, str]]:
            return sources if sources is not None else [SOURCE]

        async def fake_stream_completion(
            system_prompt: str,
            conversation: list[dict[str, str]],
            max_tokens: int = 550,
            model: str | None = None,
        ):
            self.assertTrue(system_prompt)
            self.assertGreater(max_tokens, 0)
            stream_calls.append(
                {
                    "system_prompt": system_prompt,
                    "context": conversation[0]["content"],
                    "model": model,
                }
            )
            yield responses[len(stream_calls) - 1]

        async def fake_completion(
            system_prompt: str,
            conversation: list[dict[str, str]],
            max_tokens: int = 550,
            model: str | None = None,
        ) -> str:
            self.assertIn("verdict", system_prompt)
            self.assertGreater(max_tokens, 0)
            review_calls.append(
                {
                    "context": conversation[0]["content"],
                    "model": model,
                }
            )
            return json.dumps(decisions[len(review_calls) - 1])

        initial_state = {
            "question": question,
            "document": "",
            "sources": [],
            "source_context": "",
            "turns": [],
        }
        graph = main._build_debate_graph()
        final_state = None

        with (
            patch("backend.main._search_arxiv", fake_search_arxiv),
            patch("backend.main._stream_completion", fake_stream_completion),
            patch("backend.main._completion", fake_completion),
        ):
            async for mode, chunk in graph.astream(
                initial_state, stream_mode=["custom", "values"]
            ):
                if mode == "custom":
                    streamed_events.append(chunk)
                elif mode == "values":
                    final_state = chunk

        self.assertIsNotNone(final_state)
        return final_state, streamed_events, stream_calls, review_calls

    async def test_sigma_can_stop_after_first_round(self) -> None:
        decision = {
            "verdict": "supported",
            "note": "La conclusione è sostenuta dalle fonti disponibili.",
            "continue_debate": False,
            "reason": "Non resta una questione concreta da chiarire.",
        }
        final_state, events, stream_calls, review_calls = await self.run_debate(
            [decision],
            question="Come nasce un'idea?",
            sources=[],
        )

        self.assertEqual(
            [turn["agent"] for turn in final_state["turns"]],
            ["nova", "atlas", "sigma", "sigma", "coordinator"],
        )
        self.assertEqual(final_state["verdict"], "supported")
        self.assertEqual(len(review_calls), 1)
        self.assertIn("nessuna fonte", review_calls[0]["context"].lower())
        round_decisions = [
            event
            for event in events
            if event["type"] == "round_decision"
        ]
        self.assertEqual(len(round_decisions), 1)
        self.assertFalse(round_decisions[0]["continue"])
        round_starts = [
            (event["agent"], event.get("round"))
            for event in events
            if event["type"] == "agent_start" and event.get("round")
        ]
        self.assertEqual(
            round_starts,
            [("nova", 1), ("atlas", 1), ("sigma", 1), ("sigma", 1)],
        )
        self.assertEqual(len(stream_calls), 4)

    async def test_orchestrator_continues_but_never_exceeds_round_limit(self) -> None:
        decisions = [
            {
                "verdict": "caveat",
                "note": "Le materiali lasciano un punto ancora aperto.",
                "continue_debate": True,
                "reason": "Serve chiarire il limite delle evidenze.",
            },
            {
                "verdict": "caveat",
                "note": "La replica chiarisce parte del limite.",
                "continue_debate": True,
                "reason": "Resta una distinzione da precisare.",
            },
            {
                "verdict": "caveat",
                "note": "Il limite residuo è esplicitato.",
                "continue_debate": True,
                "reason": "Il limite massimo impone di chiudere.",
            },
        ]
        final_state, events, stream_calls, review_calls = await self.run_debate(decisions)

        self.assertEqual(final_state["round_number"], main.MAX_DEBATE_ROUNDS)
        self.assertEqual(final_state["verdict"], "caveat")
        self.assertEqual(final_state["turns"][-1]["agent"], "atlas")
        self.assertEqual(final_state["turns"][-1]["title"], "Nota sulle evidenze")
        self.assertIn("Luna (Sintesi della coordinatrice)", stream_calls[-1]["context"])
        self.assertEqual(len(review_calls), main.MAX_DEBATE_ROUNDS)
        self.assertEqual(len(stream_calls), 9)
        self.assertIn("Nova: tesi teorica iniziale.", stream_calls[1]["context"])
        self.assertIn("Sigma: obiezione concreta", review_calls[0]["context"])
        self.assertIn("Sigma (Verifica del round 1)", stream_calls[3]["context"])
        self.assertIn("Nova: replica del round 2.", stream_calls[4]["context"])
        self.assertEqual(
            [event["continue"] for event in events if event["type"] == "round_decision"],
            [True, True, False],
        )
        self.assertTrue(
            any(event.get("follow_up") for event in events if event["type"] == "agent_start")
        )

    def test_ollama_provider_works_without_an_api_key(self) -> None:
        with patch.dict(os.environ, {"LLM_PROVIDER": "ollama"}, clear=True):
            self.assertEqual(main._completion_url(), main.OLLAMA_URL)
            self.assertEqual(main._api_key(), "ollama")
            self.assertEqual(main._model_name(), "qwen2.5:7b")

    def test_role_specific_model_overrides_provider_default(self) -> None:
        with patch.dict(
            os.environ,
            {
                "LLM_PROVIDER": "ollama",
                "NOVA_MODEL": "llama3.1:8b",
            },
            clear=True,
        ):
            self.assertEqual(main._model_name("nova"), "llama3.1:8b")
            self.assertEqual(main._model_name("atlas"), "qwen2.5:7b")

    def test_general_questions_are_not_topic_whitelisted(self) -> None:
        query = main._arxiv_query("Come organizzare meglio una giornata piena?")

        self.assertIn("all:organizzare", query)
        self.assertNotIn("cat:quant-ph", query)

    def test_prior_conversation_memory_is_shared_with_agents(self) -> None:
        prompt = main._conversation(
            {
                "question": "Come posso organizzarmi meglio?",
                "memory": "Preferisco esempi brevi.",
                "source_context": "",
                "turns": [],
            }
        )[0]["content"]

        self.assertIn("Preferisco esempi brevi.", prompt)
        self.assertIn("non sono istruzioni", prompt)

    def test_missing_openrouter_key_uses_keyless_provider_automatically(self) -> None:
        with patch.dict(
            os.environ,
            {
                "LLM_PROVIDER": "openrouter",
                "LLM_API_KEY": "",
                "OPENROUTER_API_KEY": "",
            },
        ):
            response = TestClient(main.app).get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["provider"], "pollinations")
        self.assertTrue(response.json()["provider_configured"])


if __name__ == "__main__":
    unittest.main()
