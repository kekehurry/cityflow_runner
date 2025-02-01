import cityflow.module as cm
from hello import hello

def main():
    return {
        "output": hello()
    }

print(hello())
cm.output = main()
