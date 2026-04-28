import SystemDataForm from './components/SystemDataForm'

export default function AdminSystemData() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dados do Sistema</h1>
        <p className="text-muted-foreground">
          Configure as informações vitais e personalizações visuais da plataforma.
        </p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-1 md:p-6">
        <SystemDataForm />
      </div>
    </div>
  )
}
