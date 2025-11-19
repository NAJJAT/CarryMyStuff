package be.ehb.carrymystuff.DTO;

import be.ehb.carrymystuff.models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank @Size(min = 6)
    private String password;

    private String phoneNumber;

    @NotBlank
    private String city;

    @NotNull
    private Role role; // USER or HELPER (ADMIN you create manually)
}