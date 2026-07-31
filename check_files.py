import os

print("--- SEARCHING FOR EXISTING VIEWS IN SRC ---")
for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            filepath = os.path.join(root, file)
            lower_name = file.lower()
            if any(term in lower_name for term in ["analytic", "alert", "setting", "pr"]):
                print(f"Found: {filepath}")