import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';

const app = express();

// Trust the proxy (Docker/Cloudflare) so we get the REAL IP of the user, not the server's IP
app.set('trust proxy', true);

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "PollSphere API is running! 🚀" });
});

app.use('/api', routes);

export default app;
