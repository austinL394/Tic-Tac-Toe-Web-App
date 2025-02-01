import LogoIcon from '../Icons/LogoIcon';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="w-32">
              <LogoIcon />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
