import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tutorService, Tutor } from '../../services/api'
import { handleApiError } from '../../utils/errorHandler'
import { ApiError } from '../../types/api.types'
import { LinkPetModal } from '../../components/LinkPetModal'

const TutorDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [unlinkingPetId, setUnlinkingPetId] = useState<number | null>(null)

  useEffect(() => {
    const fetchTutorDetails = async () => {
      if (!id) {
        setError({ message: 'ID do tutor não fornecido' })
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const tutorData = await tutorService.getById(id)
        setTutor(tutorData)
      } catch (err) {
        setError(err as ApiError)
      } finally {
        setLoading(false)
      }
    }

    fetchTutorDetails()
  }, [id])

  const handleGoBack = () => {
    navigate(-1)
  }

  const formatCpf = (cpf: number): string => {
    const cpfStr = cpf.toString().padStart(11, '0')
    return `${cpfStr.slice(0, 3)}.${cpfStr.slice(3, 6)}.${cpfStr.slice(6, 9)}-${cpfStr.slice(9)}`
  }

  const handleLinkPet = async (petId: string) => {
    if (!id) return

    try {
      await tutorService.linkPet(id, petId)
      // Recarregar dados do tutor após vincular
      const tutorData = await tutorService.getById(id)
      setTutor(tutorData)
    } catch (err) {
      throw err
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleUnlinkPet = async (petId: number, petName: string) => {
    if (!id) return

    // Confirmar antes de desvincular
    if (!window.confirm(`Tem certeza que deseja remover o vínculo com o pet "${petName}"?`)) {
      return
    }

    setUnlinkingPetId(petId)
    try {
      await tutorService.unlinkPet(id, petId.toString())
      // Recarregar dados do tutor após desvincular
      const tutorData = await tutorService.getById(id)
      setTutor(tutorData)
    } catch (err) {
      console.error('Erro ao desvincular pet:', err)
      alert('Erro ao remover o vínculo. Tente novamente.')
    } finally {
      setUnlinkingPetId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando detalhes do tutor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Erro ao carregar tutor
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4">
            {handleApiError(error)}
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

  if (!tutor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            Tutor não encontrado
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
        <div className="flex gap-3">
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Vincular Pet
          </button>
          <button
            onClick={() => navigate(`/tutores/${tutor.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Editar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Layout: Foto à esquerda, Informações à direita */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Foto do Tutor - Lateral Esquerda */}
            <div className="flex-shrink-0">
              {tutor.foto?.url ? (
                <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={tutor.foto.url}
                    alt={tutor.nome}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 text-4xl font-semibold">
                      {tutor.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Informações do Tutor - Lateral Direita */}
            <div className="flex-1 min-w-0">
              {/* Nome do Tutor com Destaque */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 border-b-4 border-blue-600 pb-4 break-words">
                {tutor.nome}
              </h1>

              {/* Informações do Tutor */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">E-mail</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white break-words break-all">
                      {tutor.email || 'Não informado'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Telefone</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                      {tutor.telefone || 'Não informado'}
                    </p>
                  </div>
                  {tutor.endereco && (
                    <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Endereço</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                        {tutor.endereco}
                      </p>
                    </div>
                  )}
                  {tutor.cpf && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPF</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                        {formatCpf(tutor.cpf)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informações dos Pets - Embaixo */}
          {tutor.pets && tutor.pets.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {tutor.pets.length === 1 ? 'Pet Vinculado' : 'Pets Vinculados'}
              </h2>
              <div className="space-y-6">
                {tutor.pets.map((pet) => {
                  const ageText = pet.idade !== undefined && pet.idade !== null 
                    ? `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'}` 
                    : 'Idade não informada'

                  return (
                    <div 
                      key={pet.id} 
                      className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate(`/pets/${pet.id}`)}
                        >
                          <div className="flex items-start gap-4 mb-4">
                            {pet.foto?.url ? (
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                <img
                                  src={pet.foto.url}
                                  alt={pet.nome}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-10 h-10 text-gray-400 dark:text-gray-500"
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
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words">
                                {pet.nome}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Raça</p>
                                  <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                                    {pet.raca || 'Não informado'}
                                  </p>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Idade</p>
                                  <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                                    {ageText}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnlinkPet(pet.id, pet.nome)
                            }}
                            disabled={unlinkingPetId === pet.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            title="Remover vínculo"
                          >
                            {unlinkingPetId === pet.id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Removendo...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span>Remover</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Vincular Pet */}
      <LinkPetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLinkPet={handleLinkPet}
        tutorId={id || ''}
        linkedPetIds={tutor.pets?.map(pet => pet.id) || []}
      />
    </div>
  )
}

export default TutorDetail
