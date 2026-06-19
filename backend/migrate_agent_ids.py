"""Migration script: convert subareas from agent_id (single) to agent_ids (array)"""
import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "database"
SUB_AREAS_PATH = DATA_DIR / "sub_areas.json"
AGENTS_PATH = DATA_DIR / "agents.json"


def migrate_subareas():
    if not SUB_AREAS_PATH.exists():
        print(f"sub_areas.json not found at {SUB_AREAS_PATH}")
        return

    with open(SUB_AREAS_PATH, "r", encoding="utf-8") as f:
        subareas = json.load(f)

    changes = 0
    for subarea in subareas:
        if "agent_id" in subarea and "agent_ids" not in subarea:
            subarea["agent_ids"] = [subarea["agent_id"]] if subarea.get("agent_id") else []
            del subarea["agent_id"]
            changes += 1
        elif "agent_ids" not in subarea:
            subarea["agent_ids"] = []
            changes += 1

    with open(SUB_AREAS_PATH, "w", encoding="utf-8") as f:
        json.dump(subareas, f, indent=2, ensure_ascii=False)

    print(f"Migrated {changes} subarea(s) from agent_id -> agent_ids")


def sync_agent_subarea_ids():
    """Ensure each agent's sub_area_ids matches subarea.agent_ids"""
    if not SUB_AREAS_PATH.exists() or not AGENTS_PATH.exists():
        print("Data files not found")
        return

    with open(SUB_AREAS_PATH, "r", encoding="utf-8") as f:
        subareas = json.load(f)

    with open(AGENTS_PATH, "r", encoding="utf-8") as f:
        agents = json.load(f)

    agent_subarea_map = {}
    for agent in agents:
        agent_subarea_map[agent["id"]] = set()

    for subarea in subareas:
        for agent_id in subarea.get("agent_ids", []):
            if agent_id in agent_subarea_map:
                agent_subarea_map[agent_id].add(subarea["id"])

    agent_changes = 0
    for agent in agents:
        correct_ids = list(agent_subarea_map.get(agent["id"], set()))
        current_ids = agent.get("sub_area_ids", [])
        if set(correct_ids) != set(current_ids):
            agent["sub_area_ids"] = correct_ids
            agent_changes += 1

    with open(AGENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(agents, f, indent=2, ensure_ascii=False)

    print(f"Synced sub_area_ids for {agent_changes} agent(s)")


if __name__ == "__main__":
    migrate_subareas()
    sync_agent_subarea_ids()
    print("Migration complete")
