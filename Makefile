.PHONY: setup

setup: waved.db

waved.db:
	sqlite3 -init SQL/initializeDatabase.sql $@ ""
