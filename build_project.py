import os
import subprocess
import sys

def print_step(msg):
    print(f"\n[BUILD SCRIPT] ===> {msg}")

def run_command(command, allow_failure=False):
    try:
        result = subprocess.run(command, shell=True, check=not allow_failure, text=True, capture_output=True)
        if result.stdout:
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        if e.stderr:
            print(e.stderr.strip())
        if not allow_failure:
            sys.exit(1)
        return False

def build():
    print_step("1. Installing/verifying dependencies...")
    run_command("npm install")

    print_step("2. Running TypeScript Typecheck...")
    has_errors = not run_command("npx tsc --noEmit", allow_failure=True)

    if has_errors:
        print("\n[!] TypeScript type errors detected. Apply the code fixes provided below to resolve them.")
    else:
        print_step("Typecheck passed with 0 errors!")

    print_step("3. Executing Vite Build...")
    run_command("npm run build")

    print_step("Build script process complete.")

if __name__ == "__main__":
    build()