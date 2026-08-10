import subprocess
import os

os.chdir(r"c:\Users\oters\Downloads\ManishProperties\ManishProperties\frontend")
result = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, shell=True)

with open("ts_error.log", "w", encoding="utf-8") as f:
    f.write("STDOUT:\n")
    f.write(result.stdout)
    f.write("\nSTDERR:\n")
    f.write(result.stderr)
