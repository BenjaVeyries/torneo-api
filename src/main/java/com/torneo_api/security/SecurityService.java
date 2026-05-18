package com.torneo_api.security;

import com.torneo_api.entity.Equipo;
import com.torneo_api.repository.EquipoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final EquipoRepository equipoRepository;

    public boolean isCapitanDeEquipo(Long equipoId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return false;
        }

        String email = "";
        if (auth.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) auth.getPrincipal()).getUsername();
        } else if (auth.getPrincipal() instanceof String) {
            email = (String) auth.getPrincipal();
        }

        if (email.isEmpty()) {
            return false;
        }

        // Si es Admin, tiene acceso total siempre
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }

        final String userEmail = email;
        Equipo equipo = equipoRepository.findById(equipoId).orElse(null);
        if (equipo == null || equipo.getCapitan() == null) {
            return false;
        }

        return equipo.getCapitan().getEmail().equals(userEmail);
    }
}
