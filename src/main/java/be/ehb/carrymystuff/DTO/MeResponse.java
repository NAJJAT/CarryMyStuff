package be.ehb.carrymystuff.DTO;

import be.ehb.carrymystuff.models.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MeResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
}
