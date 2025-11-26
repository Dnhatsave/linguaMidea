# LínguaMedia

Full-stack translation application available as both web and mobile versions.

## Project Structure

```
linguamedia/
├── frontend/          # React Native Expo mobile app
├── backend/           # FastAPI Python API server
└── index.html         # Original single-file web version
```

## Quick Start

### Backend (Required for mobile app)

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

Backend runs on `http://localhost:8000`

### Mobile App (React Native)

```bash
cd frontend
npm install
npx expo start
```

### Web Version

Simply open `index.html` in a modern browser (Chrome recommended).

## Features

- 🎤 Voice-to-voice translation
- 🌍 Multiple languages (English, Changana)
- 📝 Manual text input
- 💾 Translation history
- 🔊 Text-to-speech
- 🎨 Purple gradient UI

## Documentation

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## License

MIT
