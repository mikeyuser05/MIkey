import os
import subprocess
import sys
import shutil

def print_step(msg):
    print(f"\n[BUILD SCRIPT] ===> {msg}")

def write_file(filepath, content):
    dirname = os.path.dirname(filepath)
    if dirname:  # Only create directory if a subfolder path exists
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"   ✓ Synchronized: {filepath}")

def clean_artifacts():
    print_step("Cleaning build caches...")
    for folder in ["dist", ".vite", "node_modules/.cache"]:
        if os.path.exists(folder):
            try:
                shutil.rmtree(folder)
                print(f"   - Cleared {folder}")
            except Exception as e:
                print(f"   - Could not remove {folder}: {e}")

def run_command(command, allow_failure=False):
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=not allow_failure, 
            text=True, 
            capture_output=True,
            encoding="utf-8",
            errors="replace"
        )
        if result.stdout:
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing: {command}")
        if e.stderr:
            print(e.stderr.strip())
        if not allow_failure:
            sys.exit(1)
        return False

def main():
    clean_artifacts()

    print_step("1. Verifying dependencies...")
    run_command("npm install")

    print_step("2. Running PR43 Location Telemetry Tests...")
    run_command("npx vitest run src/tests/pr43LocationResolver.test.ts")

    print_step("3. Compiling Vite production bundle...")
    run_command("npm run build")

    print_step("🎯 PR43.5 COMPLETE: Build & Tests successfully verified!")

if __name__ == "__main__":
    main()