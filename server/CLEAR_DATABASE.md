docker exec -it finhealth-db psql -U postgres -d finhealth -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"

docker-compose down && docker-compose up -d
