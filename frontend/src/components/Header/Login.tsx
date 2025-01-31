import HeartScienceIcon from 'assets/logos/heart-science-white.svg?react';

const LoginHeader = () => {
  return (
    <div className="bg-gradient h-[91px] flex w-full flex-shrink pl-6 pr-[30px] items-center justify-between">
      <div className="flex gap-3">
        <div className="md:flex hidden">
          <HeartScienceIcon width={188} />
        </div>
      </div>
    </div>
  );
};

export default LoginHeader;
