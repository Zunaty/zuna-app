const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <p className="footer__text">
              © 2021, Built with{" "}
              <a
                href="https://nextjs.org/"
                target="_blank"
                rel="noreferrer"
              >
                Next.js
              </a>{" "}
              and{" "}
              <a
                href="https://www.typescriptlang.org/"
                target="_blank"
                rel="noreferrer"
              >
                TypeScript
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
