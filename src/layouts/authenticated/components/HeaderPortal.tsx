import { createPortal } from 'react-dom'

interface HeaderPortalProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function HeaderPortal({ title, subtitle, actions }: HeaderPortalProps) {
  const titlePortal = document.getElementById('header-title-portal')
  const actionsPortal = document.getElementById('header-actions-portal')

  return (
    <>
      {titlePortal &&
        createPortal(
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </div>,
          titlePortal
        )}

      {actionsPortal &&
        actions &&
        createPortal(<div className="flex items-center gap-2">{actions}</div>, actionsPortal)}
    </>
  )
}
