import { Pet } from '../../services/api'

interface PetCardProps {
  pet: Pet
}

const PetCard = ({ pet }: PetCardProps) => {
  const imageUrl = pet.foto?.url
  const ageText = pet.idade !== undefined && pet.idade !== null 
    ? `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'}` 
    : 'Idade não informada'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {pet.nome}
        </h3>
        <div className="space-y-1">
          {pet.raca && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Raça:</span> {pet.raca}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Idade:</span> {ageText}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PetCard
