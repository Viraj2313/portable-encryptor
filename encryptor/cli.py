import typer
from encryptor.encryptor import encrypt_folder
from encryptor.decryptor import decrypt_folder
app = typer.Typer()

@app.command()
def encrypt(
    input: str = typer.Option(..., help="Path to the folder to encrypt"),
    output: str = typer.Option(..., help="Path to the output encrypted folder"),
    password: str = typer.Option(..., prompt=True, hide_input=True, help="Password for encryption")
):
    """
    Encrypt a folder and generate encrypted output and manifest.
    """
    encrypt_folder(input, output, password)
    typer.echo("Folder encrypted successfully!")


@app.command()
def decrypt(
    encrypted_path: str,
    output_path: str,
    password: str = typer.Option(..., prompt=True, hide_input=True)
):
    decrypt_folder(encrypted_path, output_path, password)
    typer.echo("Decryption complete.")

if __name__ == "__main__":
    app()