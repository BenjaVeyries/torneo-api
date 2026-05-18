package com.torneo_api;

import com.torneo_api.auth.dto.AuthResponseDTO;
import com.torneo_api.auth.dto.LoginRequestDTO;
import com.torneo_api.auth.dto.RegisterRequestDTO;
import com.torneo_api.entity.Role;
import com.torneo_api.entity.Usuario;
import com.torneo_api.repository.UsuarioRepository;
import com.torneo_api.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
    }

    @Test
    void testRegisterUserExito() {
        RegisterRequestDTO request = new RegisterRequestDTO();
        request.setNombre("Messi");
        request.setEmail("messi@barca.com");
        request.setPassword("123456");
        request.setRole(Role.CAPITAN);

        AuthResponseDTO response = authService.register(request);

        assertNotNull(response);
        assertEquals("Usuario registrado correctamente", response.getMensaje());
        assertNotNull(response.getToken());

        assertTrue(usuarioRepository.existsByEmail("messi@barca.com"));
        Usuario usuarioGuardado = usuarioRepository.findByEmail("messi@barca.com").orElse(null);
        assertNotNull(usuarioGuardado);
        assertEquals(Role.CAPITAN, usuarioGuardado.getRole());
    }

    @Test
    void testRegisterDuplicateEmail() {
        RegisterRequestDTO request = new RegisterRequestDTO();
        request.setNombre("Cristiano");
        request.setEmail("cr7@madrid.com");
        request.setPassword("123456");
        request.setRole(Role.USER);

        authService.register(request);

        // Intentar registrar de nuevo con mismo email
        assertThrows(RuntimeException.class, () -> authService.register(request));
    }

    @Test
    void testLoginExito() {
        // Registrar primero
        RegisterRequestDTO register = new RegisterRequestDTO();
        register.setNombre("Neymar");
        register.setEmail("ney@santos.com");
        register.setPassword("123456");
        register.setRole(Role.USER);
        authService.register(register);

        // Iniciar sesión
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("ney@santos.com");
        loginRequest.setPassword("123456");

        AuthResponseDTO response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("Login exitoso", response.getMensaje());
        assertNotNull(response.getToken());
    }

    @Test
    void testLoginIncorrectPassword() {
        RegisterRequestDTO register = new RegisterRequestDTO();
        register.setNombre("Suarez");
        register.setEmail("lucho@gremio.com");
        register.setPassword("123456");
        authService.register(register);

        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("lucho@gremio.com");
        loginRequest.setPassword("password_erroneo");

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }
}
