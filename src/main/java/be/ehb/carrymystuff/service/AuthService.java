package be.ehb.carrymystuff.service;

import be.ehb.carrymystuff.DTO.*;
import be.ehb.carrymystuff.models.User;
import be.ehb.carrymystuff.Repository.UserRepository;
import be.ehb.carrymystuff.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .city(request.getCity())
                .role(request.getRole())
                .build();

        userRepository.save(user);
    }

    public String login(LoginRequest request) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword()
        );
        authenticationManager.authenticate(auth);  // ⬅️ if this fails, no token
        return jwtService.generateToken(request.getEmail());
    }

}
