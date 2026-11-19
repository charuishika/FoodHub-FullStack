package com.foodhub.auth;

import com.foodhub.auth.dto.AuthResponse;
import com.foodhub.auth.dto.LoginRequest;
import com.foodhub.auth.dto.RegisterRequest;
import com.foodhub.auth.dto.UserResponse;
import com.foodhub.common.DuplicateEmailException;
import com.foodhub.common.InvalidRequestException;
import com.foodhub.common.ResourceNotFoundException;
import com.foodhub.security.JwtService;
import com.foodhub.user.User;
import com.foodhub.user.UserRepository;
import java.time.ZoneId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password())); // BCrypt hash
        user.setRole(request.role());
        user.setTimeZone(resolveTimeZone(request));

        User saved;
        try {
            saved = userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
        
            throw new DuplicateEmailException("Email is already registered");
        }

        log.info("User registered: id={}, role={}", saved.getId(), saved.getRole());
        return UserResponse.from(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

      
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("Login failed: invalid credentials");
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        log.info("Login successful: userId={}", user.getId());
        return new AuthResponse(token, "Bearer", UserResponse.from(user));
    }

    public UserResponse getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String resolveTimeZone(RegisterRequest request) {
        String timeZone = request.timeZone();
        if (timeZone == null || timeZone.isBlank()) {
            return "UTC"; // browser could not tell its timezone: no guessing by role
        }
        timeZone = timeZone.trim();
        if (!ZoneId.getAvailableZoneIds().contains(timeZone)) {
            throw new InvalidRequestException("Invalid timezone. Use an IANA identifier such as Asia/Kolkata");
        }
        return timeZone;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}