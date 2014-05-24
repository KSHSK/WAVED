.PHONY: setup

setup: DB/waved.db projects

DB:
	mkdir $@
	chmod g+s $@

projects:
	mkdir $@
	chmod g+s $@
	setfacl -m u:www-data:rwx $@

DB/waved.db: DB
	sqlite3 -init SQL/initializeDatabase.sql $@ ""
	setfacl -m u:www-data:rw $@ # Add write access to database file to web user
	setfacl -m u:www-data:rwx DB/
