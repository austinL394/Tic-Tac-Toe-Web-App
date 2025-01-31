const Header = () => {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {/* Simple logo using CSS */}
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 text-xl font-semibold text-white">Tic-Tac-Toe</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
