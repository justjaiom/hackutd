"""Task dependency graph helpers.

Use networkx or similar to compute critical paths, topological sorts, and
identify blockers / parallelizable work.
"""
from typing import Dict, Any, List


class TaskDependencyGraph:
    def __init__(self):
        # placeholder for graph storage (e.g., networkx.Graph)
        self.graph = None

    def build(self, tasks: List[Dict[str, Any]]):
        """Build dependency graph from a list of task dicts.

        Each task dict should include an 'id' and 'depends_on' list.
        """
        # TODO: build graph and compute critical path
        pass

    def topological_order(self) -> List[str]:
        """Return tasks in a feasible order respecting dependencies."""
        return []
