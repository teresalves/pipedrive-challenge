#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE organisations (
        org_name VARCHAR ( 50 ) PRIMARY KEY
    );
    CREATE TABLE organisations_relations (
        parent VARCHAR ( 50 ),
        daughter VARCHAR ( 50 ),
        PRIMARY KEY (parent, daughter),

        CONSTRAINT FK_parent FOREIGN KEY(parent)
            REFERENCES organisations(org_name),
        
        CONSTRAINT FK_daughter FOREIGN KEY(daughter)
            REFERENCES organisations(org_name)
    );
EOSQL