import ast
import os

imports = set()

for root, _, files in os.walk("."):
    if ".venv" in root or "__pycache__" in root:
        continue

    for file in files:
        if file.endswith(".py"):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    tree = ast.parse(f.read(), filename=path)

                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        for n in node.names:
                            imports.add(n.name.split(".")[0])

                    elif isinstance(node, ast.ImportFrom):
                        if node.module:
                            imports.add(node.module.split(".")[0])

            except Exception:
                pass

print("\n".join(sorted(imports)))