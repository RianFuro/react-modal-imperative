import { createPortal } from 'react-dom'
import { createContext, useContext, useState, ReactNode } from 'react'
import './ModalContainer.css'

export type ModalContext = {
  open: (component: ReactNode) => unknown,
  close: () => unknown
}

const Context = createContext<ModalContext>({
  open: () => { throw new Error('Must be used inside context') },
  close: () => { throw new Error('Must be used inside context') },
})

export function Provider({children}) {
  const [modalComponent, setModalComponent] = useState<ReactNode | null>(null)

  const onSplashClicked = e => {
    if (e.target === e.currentTarget) setModalComponent(null)
  }

  return <Context.Provider value={{
    open: (component) => {
      setModalComponent(component)
    },
    close: () => {
      setModalComponent(null)
    }
  }}>
    {children}
    {createPortal(
      <div className="react-modal-imperative__container" style={!modalComponent ? {display: 'none'}: {}}>
        <div className="react-modal-imperative__wrapper" onClick={onSplashClicked}>
          {modalComponent}
        </div>
      </div>
      ,
      document.body)}
  </Context.Provider>
}

export function useModal() {
  return useContext(Context)
}
