import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { petStore } from '../../stores'
import { useStore } from '../../hooks/useStore'
import { handleApiError } from '../../utils/errorHandler'

const PetDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const detailState = useStore(petStore.detailState$)

  useEffect(() => {
    if (id) {
      petStore.loadPetById(id)
    }
  }, [id])

  const handleGoBack = () => {
    navigate(-1)
  }

  if (detailState.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando detalhes do pet...</p>
        </div>
      </div>
    )
  }

  if (detailState.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Erro ao carregar pet
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4">
            {handleApiError(detailState.error)}
          </p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  if (!detailState.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            Pet não encontrado
          </p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const pet = detailState.data
  const ageText = pet.idade !== undefined && pet.idade !== null 
    ? `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'}` 
    : 'Idade não informada'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar
        </button>
        <button
          onClick={() => navigate(`/pets/${pet.id}/edit`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Editar
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Layout: Foto à esquerda, Informações à direita */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Foto do Pet - Lateral Esquerda */}
            <div className="flex-shrink-0">
              {pet.foto?.url ? (
                <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={pet.foto.url}
                    alt={pet.nome}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Informações do Pet - Lateral Direita */}
            <div className="flex-1 min-w-0">
              {/* Nome do Pet com Destaque */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 border-b-4 border-blue-600 pb-4 break-words">
                {pet.nome}
              </h1>

              {/* Informações do Pet */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Informações do Pet
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Raça</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                      {pet.raca || 'Não informado'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Idade</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                      {ageText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações dos Tutores - Embaixo */}
          {pet.tutores && pet.tutores.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {pet.tutores.length === 1 ? 'Informações do Tutor' : 'Informações dos Tutores'}
              </h2>
              <div className="space-y-6">
                {pet.tutores.map((tutor) => (
                  <div key={tutor.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {tutor.foto?.url && (
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          <img
                            src={tutor.foto.url}
                            alt={tutor.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words">
                          {tutor.nome}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="min-w-0">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">E-mail</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white break-words break-all">
                              {tutor.email || 'Não informado'}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Telefone</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                              {tutor.telefone || 'Não informado'}
                            </p>
                          </div>
                          {tutor.endereco && (
                            <div className="md:col-span-2 min-w-0">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Endereço</p>
                              <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                                {tutor.endereco}
                              </p>
                            </div>
                          )}
                          {tutor.cpf && (
                            <div className="min-w-0">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPF</p>
                              <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                                {tutor.cpf.toString().replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PetDetail
