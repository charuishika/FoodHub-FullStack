package com.foodhub.config;

import com.foodhub.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CSRF protects cookie-based sessions. We use stateless Bearer tokens, so it is off.
            .csrf(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Swagger UI and API docs (public, for demo)
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Public
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()

                // OWNER only
                .requestMatchers(HttpMethod.POST, "/api/restaurants").hasRole("OWNER")
                .requestMatchers(HttpMethod.GET, "/api/restaurants/my").hasRole("OWNER")  
                .requestMatchers("/api/restaurants/*/menu/items/**").hasRole("OWNER")
                .requestMatchers(HttpMethod.GET, "/api/orders/restaurant").hasRole("OWNER")
                .requestMatchers(HttpMethod.PATCH, "/api/orders/*/status").hasRole("OWNER")
               

                // CUSTOMER only
                .requestMatchers(HttpMethod.POST, "/api/orders").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/orders/my").hasRole("CUSTOMER")

                // Everything else (browse restaurants/menus, /api/auth/me): any logged-in user
                .anyRequest().authenticated())
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, e) -> writeError(request, response,
                        HttpStatus.UNAUTHORIZED, "Authentication required: token is missing, invalid or expired"))
                .accessDeniedHandler((request, response, e) -> writeError(request, response,
                        HttpStatus.FORBIDDEN, "You do not have permission to perform this action")))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Security filters run before controllers, so @RestControllerAdvice can't catch these.
    // We write the same JSON shape by hand.
    private static void writeError(HttpServletRequest request, HttpServletResponse response,
                                   HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String path = request.getRequestURI().replace("\\", "\\\\").replace("\"", "\\\"");
        response.getWriter().write(String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                Instant.now(), status.value(), status.getReasonPhrase(), message, path));
    }
}