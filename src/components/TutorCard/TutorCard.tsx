import { useNavigate } from 'react-router-dom'
import type { Tutor } from '../../services/facade'

interface TutorCardProps {
  tutor: Tutor
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  const navigate = useNavigate()
  const imageUrl = tutor.foto?.url

  const handleClick = () => {
    navigate(`/tutores/${tutor.id}`)
  }

  const formatCpf = (cpf: number): string => {
    const cpfStr = cpf.toString().padStart(11, '0')
    return `${cpfStr.slice(0, 3)}.${cpfStr.slice(3, 6)}.${cpfStr.slice(6, 9)}-${cpfStr.slice(9)}`
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`Ver detalhes de ${tutor.nome}`}
    >
      {imageUrl && (
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={imageUrl}
            alt={tutor.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {tutor.nome}
        </h3>
        <div className="space-y-1">
          {tutor.email && (
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              <span className="font-semibold">Email:</span> {tutor.email}
            </p>
          )}
          {tutor.telefone && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Telefone:</span> {tutor.telefone}
            </p>
          )}
          {tutor.cpf && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">CPF:</span> {formatCpf(tutor.cpf)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TutorCard
