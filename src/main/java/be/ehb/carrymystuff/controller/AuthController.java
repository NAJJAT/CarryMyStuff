package be.ehb.carrymystuff.controller;
import be.ehb.carrymystuff.DTO.*;
import be.ehb.carrymystuff.models.User;
import be.ehb.carrymystuff.Repository.UserRepository;
import be.ehb.carrymystuff.security.JwtService;
import be.ehb.carrymystuff.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        return ResponseEntity.ok(new MeResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        ));
    }
}