package com.torneo_api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.torneo_api.dto.TorneoRequestDTO;
import com.torneo_api.dto.TorneoResponseDTO;
import com.torneo_api.service.TorneoService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class TorneoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TorneoService torneoService;

    @Test
    void testListarTorneosPublico() throws Exception {
        Mockito.when(torneoService.listarTorneos()).thenReturn(Collections.emptyList());

        // La consulta de torneos es pública (no necesita cabecera Authorization)
        mockMvc.perform(get("/torneos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testCrearTorneoSinAutenticacionFails() throws Exception {
        TorneoRequestDTO request = new TorneoRequestDTO();
        request.setNombre("Copa Libertadores");
        request.setTipo("Fútbol");

        // Crear torneo sin credenciales debe dar 403 Forbidden
        mockMvc.perform(post("/torneos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCrearTorneoConAdminExito() throws Exception {
        TorneoRequestDTO request = new TorneoRequestDTO();
        request.setNombre("Copa Libertadores");
        request.setTipo("Fútbol");

        TorneoResponseDTO response = TorneoResponseDTO.builder()
                .id(1L)
                .nombre("Copa Libertadores")
                .tipo("Fútbol")
                .equipos(Collections.emptyList())
                .build();

        Mockito.when(torneoService.crearTorneo(Mockito.any(TorneoRequestDTO.class))).thenReturn(response);

        // Crear torneo con usuario ADMIN debe tener éxito (201 Created)
        mockMvc.perform(post("/torneos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nombre").value("Copa Libertadores"))
                .andExpect(jsonPath("$.tipo").value("Fútbol"));
    }
}
