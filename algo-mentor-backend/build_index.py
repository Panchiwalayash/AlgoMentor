import os
import sys
import logging

from rag_manager import get_rag_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def main():
    print("==================================================")
    print("      AlgoMentor RAG Index Builder              ")
    print("==================================================")

    rag = get_rag_manager()
    print(f"Course Material Directory: {rag.material_dir}")
    print(f"Vector Storage Directory:  {rag.storage_dir}")
    print("Building / Rebuilding Vector Index...")

    count = rag.build_index()
    print("--------------------------------------------------")
    print(f"Successfully processed and indexed {count} context chunks.")
    print("Index build completed successfully!")
    print("==================================================")


if __name__ == "__main__":
    main()
