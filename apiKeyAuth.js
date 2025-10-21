require("dotenv").config();

function apiKeyMiddleware(requiredScopes = []) {
  // la fonction retournée peut être async, elle
  return async (req, res, next) => {
    try {
      const h = req.get('x-api-key') || req.get('authorization');
      const key = h?.startsWith('ApiKey ') ? h.slice(7) : h;
      if (!key) return res.status(401).json({ error: 'API key requise' });

      // Ex. simple : clé fixe en env (remplace par ta logique DB au besoin)
      if (!process.env.API_KEY_COOKIE || key !== process.env.API_KEY_COOKIE) {
        return res.status(401).json({ error: 'API key invalide' });
      }

      // Si tu gères des scopes, vérifie-les ici avec requiredScopes...
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { apiKeyMiddleware };
