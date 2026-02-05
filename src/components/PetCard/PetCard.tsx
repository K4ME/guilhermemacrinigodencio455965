import { useNavigate } from 'react-router-dom'
import type { Pet } from '../../services/facade'

interface PetCardProps {
  pet: Pet
}

const PetCard = ({ pet }: PetCardProps) => {
  const navigate = useNavigate()
  const imageUrl = pet.foto?.url
  const ageText = pet.idade !== undefined && pet.idade !== null 
    ? `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'}` 
    : 'Idade não informada'

  const handleClick = () => {
    navigate(`/pets/${pet.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`Ver detalhes de ${pet.nome}`}
    >
      {imageUrl && (
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img
            src={imageUrl}
            alt={pet.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}
      <div className="p-4 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 break-words">
          {pet.nome}
        </h3>
        <div className="space-y-1">
          {pet.raca && (
            <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
              <span className="font-semibold">Raça:</span> {pet.raca}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
            <span className="font-semibold">Idade:</span> {ageText}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PetCard
