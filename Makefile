dev-api:
	cd apps/api && pipenv run uvicorn app.main:app --reload --port 8000

dev-web:
	cd apps/web && npm run dev

dev:
	make -j2 dev-api dev-web
