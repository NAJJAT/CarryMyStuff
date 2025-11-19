package be.ehb.carrymystuff.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User customer;  // normal user

    @ManyToOne
    private User helper;    // helper/driver

    @ManyToOne
    private Vehicle vehicle;

    private String fromAddress;
    private String toAddress;

    private LocalDateTime moveDate;

    private String status;  // PENDING, ACCEPTED, DONE, CANCELED
}
