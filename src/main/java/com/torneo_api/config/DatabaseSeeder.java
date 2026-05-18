package com.torneo_api.config;

import com.torneo_api.entity.*;
import com.torneo_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final TorneoRepository torneoRepository;
    private final EquipoRepository equipoRepository;
    private final JugadorRepository jugadorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ejecutar la siembra de base de datos solo si está vacía
        if (usuarioRepository.count() == 0) {
            seedDatabase();
        }
    }

    private void seedDatabase() {
        System.out.println("🌱 Iniciando siembra automática de base de datos para la simulación...");

        // 1. Crear Usuarios (ADMIN y CAPITANES con contraseñas BCrypt)
        Usuario admin = Usuario.builder()
                .nombre("Admin Central")
                .email("admin@torneos.com")
                .password(passwordEncoder.encode("superpassword123"))
                .role(Role.ADMIN)
                .build();

        Usuario capitan1 = Usuario.builder()
                .nombre("Iker Casillas")
                .email("casillas@madrid.com")
                .password(passwordEncoder.encode("capitanpassword"))
                .role(Role.CAPITAN)
                .build();

        Usuario capitan2 = Usuario.builder()
                .nombre("Lionel Messi")
                .email("messi@barcelona.com")
                .password(passwordEncoder.encode("capitanpassword"))
                .role(Role.CAPITAN)
                .build();

        Usuario capitan3 = Usuario.builder()
                .nombre("Thomas Müller")
                .email("muller@bayern.com")
                .password(passwordEncoder.encode("capitanpassword"))
                .role(Role.CAPITAN)
                .build();

        Usuario capitan4 = Usuario.builder()
                .nombre("Kylian Mbappé")
                .email("mbappe@psg.com")
                .password(passwordEncoder.encode("capitanpassword"))
                .role(Role.CAPITAN)
                .build();

        usuarioRepository.saveAll(Arrays.asList(admin, capitan1, capitan2, capitan3, capitan4));
        System.out.println("👤 Usuarios de prueba creados (Admin Central y 4 Capitanes Demo)");

        // 2. Crear Torneo
        Torneo torneo = Torneo.builder()
                .nombre("Champions League Amateur")
                .tipo("Fútbol 11")
                .build();
        torneoRepository.save(torneo);
        System.out.println("🏆 Torneo 'Champions League Amateur' registrado");

        // 3. Crear Equipos asociados a capitanes e inscritos en el torneo
        Equipo madrid = Equipo.builder()
                .nombre("Real Madrid")
                .ciudad("Madrid")
                .capitan(capitan1)
                .torneo(torneo)
                .build();

        Equipo barcelona = Equipo.builder()
                .nombre("Barcelona")
                .ciudad("Barcelona")
                .capitan(capitan2)
                .torneo(torneo)
                .build();

        Equipo bayern = Equipo.builder()
                .nombre("Bayern Munich")
                .ciudad("Munich")
                .capitan(capitan3)
                .torneo(torneo)
                .build();

        Equipo psg = Equipo.builder()
                .nombre("PSG")
                .ciudad("Paris")
                .capitan(capitan4)
                .torneo(torneo)
                .build();

        equipoRepository.saveAll(Arrays.asList(madrid, barcelona, bayern, psg));
        System.out.println("🛡️ Equipos de demostración creados e inscritos en el torneo");

        // 4. Crear Jugadores para los equipos
        // Real Madrid
        List<Jugador> madridPlayers = Arrays.asList(
                Jugador.builder().nombre("Raul Gonzalez").edad(25).posicion("Delantero").equipo(madrid).build(),
                Jugador.builder().nombre("Cristiano Ronaldo").edad(33).posicion("Delantero").equipo(madrid).build(),
                Jugador.builder().nombre("Sergio Ramos").edad(31).posicion("Defensor").equipo(madrid).build(),
                Jugador.builder().nombre("Thibaut Courtois").edad(28).posicion("Arquero").equipo(madrid).build()
        );

        // Barcelona
        List<Jugador> barcaPlayers = Arrays.asList(
                Jugador.builder().nombre("Lionel Messi").edad(30).posicion("Delantero").equipo(barcelona).build(),
                Jugador.builder().nombre("Andres Iniesta").edad(33).posicion("Mediocampista").equipo(barcelona).build(),
                Jugador.builder().nombre("Gerard Pique").edad(30).posicion("Defensor").equipo(barcelona).build(),
                Jugador.builder().nombre("Marc-Andre Ter Stegen").edad(25).posicion("Arquero").equipo(barcelona).build()
        );

        // Bayern Munich
        List<Jugador> bayernPlayers = Arrays.asList(
                Jugador.builder().nombre("Robert Lewandowski").edad(29).posicion("Delantero").equipo(bayern).build(),
                Jugador.builder().nombre("Thomas Muller").edad(28).posicion("Delantero").equipo(bayern).build(),
                Jugador.builder().nombre("Joshua Kimmich").edad(25).posicion("Mediocampista").equipo(bayern).build(),
                Jugador.builder().nombre("Manuel Neuer").edad(32).posicion("Arquero").equipo(bayern).build()
        );

        // PSG
        List<Jugador> psgPlayers = Arrays.asList(
                Jugador.builder().nombre("Kylian Mbappe").edad(21).posicion("Delantero").equipo(psg).build(),
                Jugador.builder().nombre("Neymar Jr").edad(28).posicion("Delantero").equipo(psg).build(),
                Jugador.builder().nombre("Marquinhos").edad(26).posicion("Defensor").equipo(psg).build(),
                Jugador.builder().nombre("Keylor Navas").edad(33).posicion("Arquero").equipo(psg).build()
        );

        jugadorRepository.saveAll(madridPlayers);
        jugadorRepository.saveAll(barcaPlayers);
        jugadorRepository.saveAll(bayernPlayers);
        jugadorRepository.saveAll(psgPlayers);
        
        System.out.println("🏃 16 Jugadores profesionales creados y asignados a sus planteles");
        System.out.println("✨ Siembra de base de datos finalizada con éxito. ¡Listo para la simulación!");
    }
}
