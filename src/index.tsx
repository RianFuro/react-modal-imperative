import { createPortal } from 'react-dom'
import {createContext, useContext, useState} from 'react'
import './ModalContainer.css'

const Context = createContext({})

export function Provider({children}) {
  const [modalComponent, setModalComponent] = useState(null)

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
