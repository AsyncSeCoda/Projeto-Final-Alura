import passport from 'passport';

function local(req, res, next) {
  passport.authenticate(
    'local',
    { session: false },
    (erro, usuario) => {
      if (erro) {
        return res.status(400).json({ erro: erro.message });
      }

      if (!usuario) {
        return res.status(400).send({ erro: 'O preenchimento dos campos é obrigatório' });
      }

      req.user = usuario;
      return next();
    },
  )(req, res, next);
}

function bearer(req, res, next) {
  passport.authenticate(
    'bearer',
    { session: false },
    (erro, usuario) => {
      if (erro) {
        return res.status(400).json({ erro: erro.message });
      }

      if (!usuario) {
        return res.status(401).json();
      }

      req.user = usuario;
      return next();
    },
  )(req, res, next);
}

export { local, bearer };
