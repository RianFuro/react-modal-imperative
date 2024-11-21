import {createContext, useContext, useState, ReactNode, PropsWithChildren, CSSProperties, Fragment, useEffect, useRef} from 'react'
import { createPortal } from 'react-dom'
import './ModalContainer.css'

type Dialog = {
  reference: string,
  component: ReactNode
}

type DialogHandle = {
  readonly reference: string,
  close(): unknown
}

export type ModalContext = {
  open: (component: ReactNode) => DialogHandle,
  close: (reference?: string) => unknown,
  closeAll: () => unknown
}

const Context = createContext<ModalContext>({
  open: () => { throw new Error('Must be used inside context') },
  close: () => { throw new Error('Must be used inside context') },
  closeAll: () => { throw new Error('Must be used inside context') },
})

export type ProviderProps = PropsWithChildren<{
  className?: string
  style?: CSSProperties
}>
export function Provider({ className = '', style = {}, children }: ProviderProps) {
  const [dialogs, setDialogs] = useState<Dialog[]>([])
  const originalTarget = useRef(null)

  useEffect(() => {
    function onMouseDown(e) {
      originalTarget.current = e.target
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])
  const onSplashClicked = e => {
    if (e.target === e.currentTarget && originalTarget.current === e.target) close()
  }

  function open(component: ReactNode) {
    const reference = nextRef()
    setDialogs(dialogs => [...dialogs, { reference, component }])

    return {
      get reference() { return reference },
      close() {
        close(this.reference)
      }
    }
  }

  function close(reference?: string) {
    if (reference) setDialogs(dialogs => dialogs.filter(d => d.reference !== reference))
    else setDialogs(dialogs => dialogs.slice(0, -1))
  }

  function closeAll() {
    setDialogs([])
  }

  return <Context.Provider value={{ open, close, closeAll }}>
    {children}
    {createPortal(
      <div className={`react-modal-imperative__container ${className}`}
           style={{ ...style, ...(!dialogs.length ? {display: 'none'}: {}) }}
      >
        <div className="react-modal-imperative__wrapper" onClick={onSplashClicked}>
          {dialogs.map(d => <Fragment key={d.reference}>
            <Context.Provider value={{ open, closeAll, close: (reference => close(reference ?? d.reference)) }}>
              {d.component}
            </Context.Provider>
          </Fragment>)}
        </div>
      </div>
      ,
      document.body)}
  </Context.Provider>
}

export function useModal() {
  return useContext(Context)
}

let refCount = 1
function nextRef() {
  return `${refCount++}`
}
