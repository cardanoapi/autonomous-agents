"""Command-line interface.

The ``cli`` submodule defines Click command-line interface root and its
commands.

Resources:
    1. `Click documentation`_

.. _Click documentation:
    https://click.palletsprojects.com/en/8.1.x/

"""

from backend.cli.cli import cli


__all__ = ("cli",)
