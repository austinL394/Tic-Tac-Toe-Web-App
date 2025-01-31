import { useEffect, PropsWithChildren } from 'react';
import CloseIcon from './Icons/CloseIcon';
import classNames from 'classnames';

interface ModalProps {
  title?: string;
  showModal: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  hideCloseIcon?: boolean;
  closeUponEscape?: boolean;
  setShowModal?: (_: boolean) => void;
}

export default function Modal({
  showModal,
  setShowModal,
  title,
  fullWidth = false,
  fullHeight = false,
  hideCloseIcon = false,
  closeUponEscape = true,
  children,
}: PropsWithChildren<ModalProps>) {
  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeUponEscape) {
        setShowModal && setShowModal(false);
        e.stopPropagation();
      }
    };
    document.body.addEventListener('keydown', closeOnEscapeKey);

    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => document.body.removeEventListener('keydown', closeOnEscapeKey);
  }, [showModal, setShowModal, closeUponEscape]);

  return (
    <>
      {showModal ? (
        <>
          <div
            className="w-screen h-screen justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            onClick={() => setShowModal && setShowModal(false)}
          >
            <div
              className={classNames('relative mx-auto ', {
                'w-auto': !fullWidth,
                'w-screen': fullWidth,
                'h-screen': fullHeight,
              })}
              onClick={(e) => e.stopPropagation()}
            >
              {/*content*/}
              <div
                className={classNames(
                  'flex flex-col border-0 rounded-lg shadow-lg relative w-full bg-white outline-none focus:outline-none',
                  {
                    'h-full': fullHeight,
                  },
                )}
              >
                {/*header*/}
                <div className="flex items-start bg-black justify-between items-center px-6 py-6 border-b border-solid border-b-black rounded-t">
                  <h3 className="font-bold text-white">{title}</h3>
                  <button
                    className="p-1 ml-auto border-0 text-white float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal && setShowModal(false)}
                  >
                    {!hideCloseIcon && <CloseIcon height="2rem" fill="white" />}
                  </button>
                </div>
                {children}
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 modal-overlay"></div>
        </>
      ) : null}
    </>
  );
}
