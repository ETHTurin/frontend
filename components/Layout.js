import NavLink from "./NavLink";

function Layout(props) {
  return (
    <div className="h-screen flex flex-col">
      <header className="shadow-lg w-full">
        <nav className="flex space-x-4 justify-center">
          <NavLink href="/registerCopyright">Register copyright</NavLink>
          <NavLink href="/payCopyright">Pay copyright</NavLink>
        </nav>
      </header>

      <main className="w-full flex-1 py-10 bg-gray-200">
        <div className="container mx-auto">{props.children}</div>
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center hover:underline"
          href="https://twitter.com/ethturin"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with 💜 by ETHTurin
        </a>
      </footer>
    </div>
  );
}

export default Layout;
