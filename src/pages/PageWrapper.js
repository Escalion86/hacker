import cn from 'classnames'
import SearchIcon from '../icons/SearchIcon'
import ArrowBack from '../icons/ArrowBack'

const PageWrapper = ({ title, size, children, onClickBack, noSearchIcon }) => (
  <div
    className={cn(
      'select-none px-0.5 dark:text-white text-black bg-white dark:bg-black max-h-screen min-h-screen flex flex-col gap-x-2 gap-y-4 overflow-y-scroll pb-5',
      size === 'small' ? 'gap-y-4' : size === 'big' ? 'gap-y-5' : 'gap-y-4'
    )}
  >
    <div
      className={cn(
        'bg-white dark:bg-black z-10 sticky top-0 font-bold flex justify-between items-center',
        size === 'small'
          ? 'pl-5 pr-4 pt-5 pb-3'
          : size === 'big'
          ? 'pl-6 pr-6 pt-8 pb-3.5'
          : 'pl-6 pr-5 pt-6 pb-3.5'
      )}
      // onClick={toggleTheme}
    >
      {onClickBack && (
        <div
          onClick={onClickBack}
          className="button cursor-pointer -ml-6 p-5 -mb-3.5 -mt-3.5 rounded-full"
        >
          <ArrowBack size={size} className="fill-black dark:fill-white" />
        </div>
      )}
      <div
        className={cn(
          'text-left flex-1',
          size === 'small' ? 'text-lg' : size === 'big' ? 'text-2xl' : 'text-xl'
        )}
      >
        {title}
      </div>
      {!noSearchIcon && (
        <SearchIcon size={size} className="fill-black dark:fill-white" />
      )}
    </div>
    {children}
  </div>
)

export default PageWrapper
