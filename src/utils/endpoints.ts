const API = import.meta.env.VITE_API_URL

export const Endpoints = {
    // Login
    AUTENTICAR_LOGIN: `${API}/auth/login`,

    // Usuário
    USUARIO_ATUAL: `${API}/users/me`,
    ATUALIZAR_USUARIO: `${API}/users/update`,
    REGISTRAR_USUARIO: `${API}/users`,

    // Activities (atividades livres)
    ATIVIDADES: `${API}/activities`,
    CRIAR_ATIVIDADE: `${API}/activities`,
    CALCULAR_ROTA: `${API}/activities/calculate-route`,

    // Corridas Públicas (Calendário Geral)
    CORRIDAS_PUBLICAS: `${API}/runs`,

    // Grupos
    GRUPOS: `${API}/groups`,
    CRIAR_GRUPO: `${API}/groups`,
    EXCLUIR_GRUPO: (id: string) => `${API}/groups/${id}`,
    GRUPO_POR_ID: (id: string) => `${API}/groups/${id}`,
    SOLICITAR_ENTRADA: (id: string) => `${API}/groups/${id}/join`,
    FEED_DO_GRUPO: (id: string) => `${API}/groups/${id}/feed`,
    APROVAR_MEMBRO: (grupoId: string, userId: string) => `${API}/groups/${grupoId}/approve/${userId}`,
    PROMOVER_ADMIN: (grupoId: string, userId: string) => `${API}/groups/${grupoId}/promote/${userId}`,
    REMOVER_MEMBRO: (groupId: string, userId: string) => `${API}/groups/${groupId}/remove-member/${userId}`,
    SAIR_DO_GRUPO: (groupId: string) => `${API}/groups/${groupId}/leave`,

    // Rotas
    CRIAR_ROTA: `${API}/routes`,
    ROTAS_POR_GRUPO: (grupoId: string) => `${API}/routes/groups/${grupoId}`,
    EXCLUIR_ROTA: (rotaId: string) => `${API}/routes/${rotaId}`,
    ROTA_POR_ID: (rotaId: string) => `${API}/routes/specific/${rotaId}`,
    
    // Realizações
    CRIAR_REALIZACAO: `${API}/accomplishments`,
    REALIZACOES_DA_ROTA: (rotaId: string) => `${API}/accomplishments/routes/${rotaId}`,

}
