.PHONY: setup generated_files data

setup: waved.db generated_files data

setup: generated_files data waved.db

waved.db:
	sqlite3 -init sql/initializeDatabase.sql $@ "" # Create database file
	setfacl -m u:www-data:rw $@ # Add write access to database file to web user
	setfacl -m u:www-data:rwx . #TODO: Why does it need write access to the folder

generated_files:
	setfacl -m u:www-data:rwx generated_files

data:
	setfacl -m u:www-data:rwx data
