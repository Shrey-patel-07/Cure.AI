all:
	gnome-terminal -- bash -c "cd Backend && npm start"
	gnome-terminal -- bash -c "cd frontend && npm run dev"
	gnome-terminal -- bash -c "cd Flask-Backend && source venv/bin/activate && python app.py"

.PHONY: all
