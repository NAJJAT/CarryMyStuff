package be.ehb.carrymystuff.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public  class AddVehicleRequest {
    @NotBlank
    private String type;
    @NotBlank
    private String description;
    private Integer capacityKg;
    @NotBlank
    private String city;
    @NotBlank
    private String licensePlate;

}
