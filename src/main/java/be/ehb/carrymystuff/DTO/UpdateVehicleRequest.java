package be.ehb.carrymystuff.DTO;

import lombok.Data;

@Data
public class UpdateVehicleRequest {

    private String type;          // optional
    private String description;   // optional
    private Integer capacityKg;   // optional
    private String city;          // optional
    private String licensePlate;  // optional
}
